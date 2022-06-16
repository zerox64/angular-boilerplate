// Angular modules
import { OnInit }         from '@angular/core';
import { Component }      from '@angular/core';
import { FormGroup }      from '@angular/forms';
import { FormControl }    from '@angular/forms';
import { Validators }     from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';
import { Params }         from '@angular/router';

// Internal modules
import { environment }    from '@env/environment';

// Helpers
import { EmitterHelper }  from '@helpers/emitter.helper';

// Services
import { AppService }     from '@services/app.service';

@Component({
  selector    : 'app-validate-account',
  templateUrl : './validate-account.component.html',
  styleUrls   : ['./validate-account.component.scss']
})
export class ValidateAccountComponent implements OnInit
{
  public  formGroup    !: FormGroup<{
    password : FormControl<string>
  }>;
  private tokenFromUrl  : string = '';

  constructor
  (
    private router         : Router,
    private activatedRoute : ActivatedRoute,
    private appService     : AppService,
  )
  {
    this.initFormGroup();
  }

  public async ngOnInit() : Promise<void>
  {
    // NOTE Get token from URL
    this.activatedRoute.queryParams.subscribe((params : Params) =>
    {
      this.tokenFromUrl = params['token'];
      if (!environment.production)
        console.log('ValidateAccountComponent : ngOnInit -> Token : ', this.tokenFromUrl);
    });
  }

  // -------------------------------------------------------------------------------
  // ---- NOTE Init ----------------------------------------------------------------
  // -------------------------------------------------------------------------------

  private initFormGroup() : void
  {
    this.formGroup = new FormGroup({
      password   : new FormControl<string>({
        value    : '',
        disabled : false
      }, { validators : [Validators.required], nonNullable : true }),
    });
  }

  // -------------------------------------------------------------------------------
  // ---- NOTE Actions -------------------------------------------------------------
  // -------------------------------------------------------------------------------

  public async onClickSubmit() : Promise<void>
  {
    if (!this.tokenFromUrl)
      return;

    await this.validateNewAccount();
  }

  // -------------------------------------------------------------------------------
  // ---- NOTE Requests ------------------------------------------------------------
  // -------------------------------------------------------------------------------

  private async validateNewAccount() : Promise<void>
  {
    EmitterHelper.sendAuthLoading(true);

    const password = this.formGroup.controls.password.getRawValue();
    const success  = await this.appService.validateAccount(this.tokenFromUrl, password);

    EmitterHelper.sendAuthLoading(false);

    if (!success)
      return;

    // NOTE Redirect to home
    this.router.navigate(['/home']);
  }

  // -------------------------------------------------------------------------------
  // ---- NOTE Helpers -------------------------------------------------------------
  // -------------------------------------------------------------------------------

}
