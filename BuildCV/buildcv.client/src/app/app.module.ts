import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CvBuilderComponent } from './cv-builder/cv-builder.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ExperienceComponent } from './experience/experience.component';
import { EducationComponent } from './education/education.component';
import { SkillsComponent } from './skills/skills.component';
import { PreviewComponent } from './preview/preview.component';
import { ProjectsComponent } from './projects/projects.component';
import { AdditionalComponent } from './additional/additional.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChooseThemeComponent } from './choose-theme/choose-theme.component';
import { CvUploadComponent } from './cv-upload/cv-upload.component';
import { LimaTemplateComponent } from './preview/templates/lima-template/lima-template.component';
import { RotterdamTemplateComponent } from './preview/templates/rotterdam-template/rotterdam-template.component';
import { RigaTemplateComponent } from './preview/templates/riga-template/riga-template.component';
import { ATSTemplateComponent } from './preview/templates/ats-template/ats-template.component';
import { CustomizeMenuComponent } from './preview/customize-menu/customize-menu.component';
import { TrustUrlPipe } from './preview/trust-url.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CvBuilderComponent,
    PersonalInfoComponent,
    ExperienceComponent,
    EducationComponent,
    SkillsComponent,
    ProjectsComponent,
    AdditionalComponent,
    PreviewComponent,
    ChooseThemeComponent,
    CvUploadComponent,
    CustomizeMenuComponent,
    LimaTemplateComponent,
    RigaTemplateComponent,
    RotterdamTemplateComponent,
    TrustUrlPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ATSTemplateComponent
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
