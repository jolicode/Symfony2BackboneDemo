<?php

namespace Paztek\Bundle\HomeBundle\Form\Extension\Csrf\CsrfProvider;

use Symfony\Component\Form\Extension\Csrf\CsrfProvider\DefaultCsrfProvider as BaseCsrfProvider;

/**
 * This dummy Csrf provider is used to replace the default one (form.csrf_provider) usually used on the login form.
 * It's necessary as the SecurityBundle (or the FOSUSerBundle) doesn't allow us to disable CSRF-protection only on login form
 * 
 * @author matthieu
 *
 */
class AlwaysTrueCsrfProvider extends BaseCsrfProvider
{
    /**
     * {@inheritDoc}
     */
    public function isCsrfTokenValid($intention, $token)
    {
        return true;
    }
}