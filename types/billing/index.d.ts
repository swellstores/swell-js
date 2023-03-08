import {
    BillingCamel,
    BillingAffirmCamel,
    BillingResolveCamel,
    BillingKlarnaCamel,
    BillingIdealCamel,
    BillingBancontactCamel,
    BillingGoogleCamel,
    BillingAppleCamel
} from './camel'
import {
    BillingSnake,
    BillingAffirmSnake,
    BillingResolveSnake,
    BillingKlarnaSnake,
    BillingIdealSnake,
    BillingBancontactSnake,
    BillingGoogleSnake,
    BillingAppleSnake
} from './snake'

export interface Billing extends BillingCamel, BillingSnake { }
export interface BillingAffirm extends BillingAffirmCamel, BillingAffirmSnake { }
export interface BilingResolve extends BillingResolveCamel, BillingResolveSnake { }
export interface BillingKlarna extends BillingKlarnaCamel, BillingKlarnaSnake { }
export interface BillingIdeal extends BillingIdealCamel, BillingIdealSnake { }
export interface BillingBancontact extends BillingBancontactCamel, BillingBancontactSnake { }
export interface BillingGoogle extends BillingGoogleCamel, BillingGoogleSnake { }
export interface BillingApple extends BillingAppleCamel, BillingAppleSnake { }