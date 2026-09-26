from typing import Dict, Any, List
from ..models import Scheme, Application, SchemeRule, SchemeDocumentRequirement

class EligibilityEngine:
    def evaluate_rule(self, operator: str, actual_value: Any, target_value: Any) -> bool:
        """
        Executes a deterministic rule comparison
        """
        op = operator.lower()
        if op == "required":
            return actual_value is not None and str(actual_value).strip() != ""
        
        if actual_value is None:
            return False

        if op == "equals":
            return str(actual_value).strip().lower() == str(target_value).strip().lower()

        if op == "in":
            targets = [t.strip().lower() for t in str(target_value).split(",")]
            return str(actual_value).strip().lower() in targets

        if op == "gte":
            try:
                # Extract number if string like '79.5%'
                clean_actual = float(''.join(c for c in str(actual_value) if c.isdigit() or c == '.'))
                clean_target = float(''.join(c for c in str(target_value) if c.isdigit() or c == '.'))
                return clean_actual >= clean_target
            except Exception:
                return False

        if op == "lte":
            try:
                clean_actual = float(''.join(c for c in str(actual_value) if c.isdigit() or c == '.'))
                clean_target = float(''.join(c for c in str(target_value) if c.isdigit() or c == '.'))
                return clean_actual <= clean_target
            except Exception:
                return False

        return False

    def evaluate_application(
        self, 
        scheme: Scheme, 
        application: Application,
        answers_dict: Dict[str, Any],
        uploaded_doc_types: List[str]
    ) -> Dict[str, Any]:
        """
        Evaluates an application against scheme rules and document requirements,
        producing an explainable audit verdict.
        """
        rule_evaluations = []
        doc_evaluations = []
        passed_count = 0
        warning_count = 0
        failed_count = 0
        recommendations = []

        # 1. Evaluate scheme rules
        for rule in scheme.rules:
            field_name = rule.field_name
            actual_val = answers_dict.get(field_name)
            
            # Check profile fallback
            if actual_val is None and application.applicant and application.applicant.profile:
                profile = application.applicant.profile
                if field_name == "category" or field_name == "st_status":
                    actual_val = profile.st_status
                elif field_name == "percentage" or field_name == "marks":
                    actual_val = profile.percentage
                elif field_name == "highest_qualification":
                    actual_val = profile.highest_qualification

            is_satisfied = self.evaluate_rule(rule.operator, actual_val, rule.target_value)
            
            if is_satisfied:
                passed_count += 1
                rule_evaluations.append({
                    "field_name": field_name,
                    "operator": rule.operator,
                    "target_value": rule.target_value,
                    "actual_value": str(actual_val) if actual_val is not None else "Provided",
                    "status": "PASS",
                    "severity": rule.severity,
                    "message": f"Rule satisfied: {rule.description}"
                })
            else:
                if rule.severity == "Mandatory":
                    failed_count += 1
                    status = "FAIL"
                    recommendations.append(f"Resolve mandatory requirement: {rule.description}")
                else:
                    warning_count += 1
                    status = "WARNING"
                    recommendations.append(f"Recommended criteria pending: {rule.description}")

                rule_evaluations.append({
                    "field_name": field_name,
                    "operator": rule.operator,
                    "target_value": rule.target_value,
                    "actual_value": str(actual_val) if actual_val is not None else "Missing",
                    "status": status,
                    "severity": rule.severity,
                    "message": f"Criterion not met: {rule.description} (Found: '{actual_val}')"
                })

        # 2. Check Document Requirements
        norm_uploaded = [d.upper() for d in uploaded_doc_types]
        for req in scheme.doc_requirements:
            is_uploaded = any(req.document_type.upper() in d for d in norm_uploaded)
            if is_uploaded:
                doc_evaluations.append({
                    "document_type": req.document_type,
                    "display_name": req.display_name,
                    "status": "PASS",
                    "message": f"Verified upload for {req.display_name}"
                })
            else:
                if req.is_mandatory:
                    failed_count += 1
                    status = "FAIL"
                    recommendations.append(f"Upload mandatory document: {req.display_name}")
                else:
                    warning_count += 1
                    status = "WARNING"
                    recommendations.append(f"Optional document recommended: {req.display_name}")

                doc_evaluations.append({
                    "document_type": req.document_type,
                    "display_name": req.display_name,
                    "status": status,
                    "message": f"Missing document: {req.display_name}"
                })

        # Check if there is an active deficiency or name mismatch in the application
        has_name_warning = False
        for vr in application.verification_results:
            if vr.status == "WARNING":
                has_name_warning = True
                warning_count += 1
                recommendations.append(f"Review required: {vr.message}")

        # Overall Status Determination
        if failed_count > 0:
            overall_status = "Ineligible"
            summary_explanation = f"Application does not meet {failed_count} mandatory eligibility or documentation criteria."
        elif warning_count > 0 or has_name_warning:
            overall_status = "Eligible — Pending Human Verification"
            summary_explanation = "Application satisfies key criteria; flagged items or name variations require administrative officer confirmation."
        else:
            overall_status = "Eligible"
            summary_explanation = "All deterministic criteria and required documents successfully validated."

        return {
            "overall_status": overall_status,
            "passed_count": passed_count + len([d for d in doc_evaluations if d["status"] == "PASS"]),
            "warning_count": warning_count,
            "failed_count": failed_count,
            "rule_results": rule_evaluations,
            "document_results": doc_evaluations,
            "summary_explanation": summary_explanation,
            "recommendations": recommendations
        }

eligibility_engine = EligibilityEngine()
