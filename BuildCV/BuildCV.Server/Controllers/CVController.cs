using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace BuildCV.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CVController : ControllerBase
    {
        private readonly ICVService _cvService;

        public CVController(ICVService cvService)
        {
            _cvService = cvService;
        }

        [HttpPost("preview")]
        public ActionResult<CVPreviewResponse> GeneratePreview([FromBody] CVData cvData)
        {
            try
            {
                var preview = _cvService.GeneratePreview(cvData);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("export/pdf")]
        public ActionResult<byte[]> ExportToPdf([FromBody] CVExportRequest request)
        {
            try
            {
                var pdfBytes = _cvService.ExportToPdf(request.CVData, request.TemplateId);
                return File(pdfBytes, "application/pdf", "CV.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("templates")]
        public ActionResult<List<CVTemplate>> GetTemplates()
        {
            try
            {
                var templates = _cvService.GetAvailableTemplates();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("validate")]
        public ActionResult<ValidationResult> ValidateCV([FromBody] CVData cvData)
        {
            try
            {
                var validationResult = _cvService.ValidateCV(cvData);
                return Ok(validationResult);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
