using BuildCV.Server.Models;
using System.Text;

namespace BuildCV.Server.Services
{
    public class CVService : ICVService
    {
        public CVPreviewResponse GeneratePreview(CVData cvData)
        {
            var html = GenerateHtmlFromTemplate(cvData, "modern");
            return new CVPreviewResponse
            {
                HtmlContent = html,
                TemplateId = "modern"
            };
        }

        public byte[] ExportToPdf(CVData cvData, string templateId)
        {
            // For now, return empty byte array
            // In production, use a library like SelectPdf or IronPDF
            var html = GenerateHtmlFromTemplate(cvData, templateId);
            return Encoding.UTF8.GetBytes(html);
        }

        public List<CVTemplate> GetAvailableTemplates()
        {
            return new List<CVTemplate>
            {
                new CVTemplate
                {
                    Id = "modern",
                    Name = "Modern Professional",
                    Description = "Clean, ATS-friendly design with modern typography",
                    PreviewImage = "/templates/modern.png"
                },
                new CVTemplate
                {
                    Id = "classic",
                    Name = "Classic",
                    Description = "Traditional format optimized for ATS",
                    PreviewImage = "/templates/classic.png"
                },
                new CVTemplate
                {
                    Id = "minimal",
                    Name = "Minimal",
                    Description = "Minimalist design with maximum readability",
                    PreviewImage = "/templates/minimal.png"
                },
                new CVTemplate
                {
                    Id = "creative",
                    Name = "Creative",
                    Description = "Stand out with a creative yet ATS-compliant design",
                    PreviewImage = "/templates/creative.png"
                }
            };
        }

        public ValidationResult ValidateCV(CVData cvData)
        {
            var result = new ValidationResult { IsValid = true };

            if (string.IsNullOrWhiteSpace(cvData.PersonalInfo.FullName))
            {
                result.IsValid = false;
                result.Errors.Add("Full name is required");
            }

            if (string.IsNullOrWhiteSpace(cvData.PersonalInfo.Email))
            {
                result.IsValid = false;
                result.Errors.Add("Email is required");
            }

            if (string.IsNullOrWhiteSpace(cvData.ProfessionalSummary))
            {
                result.Warnings.Add("Consider adding a professional summary");
            }

            if (cvData.Experiences.Count == 0)
            {
                result.Warnings.Add("No work experience added");
            }

            if (cvData.Skills.Count == 0)
            {
                result.Warnings.Add("Consider adding skills to improve ATS score");
            }

            return result;
        }

        private string GenerateHtmlFromTemplate(CVData cvData, string templateId)
        {
            return templateId switch
            {
                "modern" => GenerateModernTemplate(cvData),
                "classic" => GenerateClassicTemplate(cvData),
                "minimal" => GenerateMinimalTemplate(cvData),
                "creative" => GenerateCreativeTemplate(cvData),
                _ => GenerateModernTemplate(cvData)
            };
        }

        private string GenerateModernTemplate(CVData cvData)
        {
            var sb = new StringBuilder();
            sb.Append("<div class='cv-container modern-template'>");

            // Header
            sb.Append("<header class='cv-header'>");
            sb.Append($"<h1>{cvData.PersonalInfo.FullName}</h1>");
            sb.Append("<div class='contact-info'>");
            sb.Append($"<span>{cvData.PersonalInfo.Email}</span>");
            if (!string.IsNullOrEmpty(cvData.PersonalInfo.Phone))
                sb.Append($"<span>{cvData.PersonalInfo.Phone}</span>");
            if (!string.IsNullOrEmpty(cvData.PersonalInfo.Location))
                sb.Append($"<span>{cvData.PersonalInfo.Location}</span>");
            sb.Append("</div>");
            sb.Append("</header>");

            // Professional Summary
            if (!string.IsNullOrEmpty(cvData.ProfessionalSummary))
            {
                sb.Append("<section class='cv-section'>");
                sb.Append("<h2>Professional Summary</h2>");
                sb.Append($"<p>{cvData.ProfessionalSummary}</p>");
                sb.Append("</section>");
            }

            // Experience
            if (cvData.Experiences.Any())
            {
                sb.Append("<section class='cv-section'>");
                sb.Append("<h2>Experience</h2>");
                foreach (var exp in cvData.Experiences)
                {
                    sb.Append("<div class='experience-item'>");
                    sb.Append($"<h3>{exp.JobTitle}</h3>");
                    sb.Append($"<div class='company-info'>{exp.Company} | {exp.Location}</div>");
                    sb.Append($"<div class='date-range'>{exp.StartDate} - {(exp.IsCurrent ? "Present" : exp.EndDate)}</div>");
                    if (exp.Responsibilities.Any())
                    {
                        sb.Append("<ul>");
                        foreach (var resp in exp.Responsibilities)
                        {
                            sb.Append($"<li>{resp}</li>");
                        }
                        sb.Append("</ul>");
                    }
                    sb.Append("</div>");
                }
                sb.Append("</section>");
            }

            // Education
            if (cvData.Education.Any())
            {
                sb.Append("<section class='cv-section'>");
                sb.Append("<h2>Education</h2>");
                foreach (var edu in cvData.Education)
                {
                    sb.Append("<div class='education-item'>");
                    sb.Append($"<h3>{edu.Degree}</h3>");
                    sb.Append($"<div>{edu.Institution} | {edu.Location}</div>");
                    sb.Append($"<div class='date-range'>{edu.StartDate} - {edu.EndDate}</div>");
                    sb.Append("</div>");
                }
                sb.Append("</section>");
            }

            // Skills
            if (cvData.Skills.Any())
            {
                sb.Append("<section class='cv-section'>");
                sb.Append("<h2>Skills</h2>");
                sb.Append("<div class='skills-list'>");
                sb.Append(string.Join(", ", cvData.Skills));
                sb.Append("</div>");
                sb.Append("</section>");
            }

            sb.Append("</div>");
            return sb.ToString();
        }

        private string GenerateClassicTemplate(CVData cvData)
        {
            // Similar structure with classic styling
            return GenerateModernTemplate(cvData).Replace("modern-template", "classic-template");
        }

        private string GenerateMinimalTemplate(CVData cvData)
        {
            return GenerateModernTemplate(cvData).Replace("modern-template", "minimal-template");
        }

        private string GenerateCreativeTemplate(CVData cvData)
        {
            return GenerateModernTemplate(cvData).Replace("modern-template", "creative-template");
        }
    }
}