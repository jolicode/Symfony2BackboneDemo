<?php

namespace Paztek\Bundle\HomeBundle\Form\Extension\Csrf\CsrfProvider;

use Symfony\Component\Form\Extension\Csrf\CsrfProvider\DefaultCsrfProvider as BaseCsrfProvider;

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