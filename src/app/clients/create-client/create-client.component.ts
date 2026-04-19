import { Component, Optional, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { ClientsService } from '../clients.service';
import { ClientGeneralStepComponent } from '../client-stepper/client-general-step/client-general-step.component';
import { ClientFamilyMembersStepComponent } from '../client-stepper/client-family-members-step/client-family-members-step.component';
import { ClientAddressStepComponent } from '../client-stepper/client-address-step/client-address-step.component';
import { ClientDatatableStepComponent } from '../client-stepper/client-datatable-step/client-datatable-step.component';
import { SettingsService } from 'app/settings/settings.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkStepper } from '@angular/cdk/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatIconButton,
    MatDialogModule,
    ClientGeneralStepComponent,
    ClientFamilyMembersStepComponent,
    ClientAddressStepComponent,
    ClientDatatableStepComponent
  ],
  providers: [
    { provide: CdkStepper, useValue: {} }
  ]
})
export class CreateClientComponent {
  @ViewChild(ClientGeneralStepComponent) clientGeneralStep: ClientGeneralStepComponent;
  @ViewChild('clientFamily') clientFamilyMembersStep: ClientFamilyMembersStepComponent;
  @ViewChild('clientAddress') clientAddressStep: ClientAddressStepComponent;
  @ViewChildren('dtclient') clientDatatables: QueryList<ClientDatatableStepComponent>;

  datatables: any = [];
  legalFormType = 1;
  clientTemplate: any;
  clientAddressFieldConfig: any;
  isDialog = false;

  sections: { [key: string]: boolean } = {
    family: false,
    address: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    @Optional() private dialogRef: MatDialogRef<CreateClientComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) {
    this.isDialog = !!this.dialogRef;

    if (this.isDialog && this.dialogData) {
      this.clientTemplate = this.dialogData.clientTemplate;
      this.clientAddressFieldConfig = this.dialogData.clientAddressFieldConfig;
      this.setDatatables();
    } else {
      this.route.data.subscribe((data: { clientTemplate: any; clientAddressFieldConfig: any }) => {
        this.clientTemplate = data.clientTemplate;
        this.clientAddressFieldConfig = data.clientAddressFieldConfig;
        this.setDatatables();
      });
    }
  }

  close() {
    if (this.isDialog) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  get clientGeneralForm() {
    return this.clientGeneralStep?.createClientForm;
  }

  get client() {
    const base = this.clientGeneralStep?.clientGeneralDetails || {};
    const family = this.clientFamilyMembersStep ? this.clientFamilyMembersStep.familyMembers : {};
    const address = (this.clientTemplate?.isAddressEnabled && this.clientAddressStep) ? this.clientAddressStep.address : {};
    return { ...base, ...family, ...address };
  }

  areFormvalids(): boolean {
    let valid = this.clientGeneralForm?.valid || false;
    if (this.clientTemplate?.isAddressEnabled && this.clientAddressStep && this.sections.address) {
      valid = valid && this.clientAddressStep.address.address.length > 0;
    }
    if (this.clientTemplate?.datatables?.length > 0 && this.clientDatatables) {
      this.clientDatatables.forEach((dt: ClientDatatableStepComponent) => {
        valid = valid && dt.datatableForm.valid;
      });
    }
    return valid;
  }

  setDatatables(): void {
    this.datatables = [];
    const type = this.legalFormType === 2 ? 'entity' : 'person';
    this.clientTemplate?.datatables?.forEach((dt: any) => {
      if (dt.entitySubType.toLowerCase() === type) this.datatables.push(dt);
    });
  }

  legalFormChange(eventData: { legalForm: number }) {
    this.legalFormType = eventData.legalForm;
    this.setDatatables();
  }

  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const clientData = { ...this.client, dateFormat, locale };

    if (this.clientTemplate?.datatables?.length > 0) {
      const datatables: any[] = [];
      this.clientDatatables?.forEach((dt: ClientDatatableStepComponent) => datatables.push(dt.payload));
      clientData['datatables'] = datatables;
    }

    this.clientsService.createClient(clientData).subscribe((response: any) => {
      if (this.isDialog) {
        this.dialogRef.close(response);
      } else {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
      }
    });
  }
}
