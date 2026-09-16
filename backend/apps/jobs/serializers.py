from rest_framework import serializers

from apps.core.security import safe_upload_filename, validate_file_upload
from .models import Company, Job


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ("id", "name", "logo", "website")

    def validate_logo(self, value):
        is_valid, error_message = validate_file_upload(value, ["jpg", "jpeg", "png", "gif", "webp"], 5 * 1024 * 1024)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Job
        fields = (
            "id",
            "company",
            "company_name",
            "title",
            "slug",
            "location",
            "work_mode",
            "job_type",
            "experience",
            "qualification",
            "eligible_batch",
            "salary",
            "job_id",
            "short_description",
            "description",
            "responsibilities",
            "eligibility",
            "required_skills",
            "preferred_skills",
            "selection_process",
            "application_process",
            "interview_preparation",
            "fraud_alert",
            "official_url",
            "deadline",
            "published_at",
            "is_published",
            "is_featured",
            "priority",
            "seo_title",
            "seo_description",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "company", "created_at", "updated_at")
        extra_kwargs = {
            "title": {"required": False, "allow_blank": True},
            "location": {"required": False, "allow_blank": True},
            "work_mode": {"required": False, "allow_blank": True},
            "job_type": {"required": False, "allow_blank": True},
            "experience": {"required": False, "allow_blank": True},
            "qualification": {"required": False, "allow_blank": True},
            "eligible_batch": {"required": False, "allow_blank": True},
            "salary": {"required": False, "allow_blank": True},
            "job_id": {"required": False, "allow_blank": True},
            "short_description": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "responsibilities": {"required": False, "allow_blank": True},
            "eligibility": {"required": False, "allow_blank": True},
            "required_skills": {"required": False, "allow_blank": True},
            "preferred_skills": {"required": False, "allow_blank": True},
            "selection_process": {"required": False, "allow_blank": True},
            "application_process": {"required": False, "allow_blank": True},
            "interview_preparation": {"required": False, "allow_blank": True},
            "fraud_alert": {"required": False, "allow_blank": True},
            "official_url": {"required": False, "allow_blank": True},
            "seo_title": {"required": False, "allow_blank": True},
            "seo_description": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "").strip()
        company = None
        if company_name:
            company, _ = Company.objects.get_or_create(name=company_name)
        else:
            company, _ = Company.objects.get_or_create(name="SkillBloom")

        job = Job.objects.create(company=company, **validated_data)
        return job


class JobListSerializer(JobSerializer):
    pass


class JobCreateSerializer(JobSerializer):
    class Meta(JobSerializer.Meta):
        fields = JobSerializer.Meta.fields
        read_only_fields = ("id", "slug", "company", "created_at", "updated_at")
