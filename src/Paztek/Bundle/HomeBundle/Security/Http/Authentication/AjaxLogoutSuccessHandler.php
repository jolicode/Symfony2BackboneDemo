<?php

namespace Paztek\Bundle\HomeBundle\Security\Http\Authentication;

use Symfony\Component\Security\Http\Logout\LogoutSuccessHandlerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AjaxLogoutSuccessHandler implements LogoutSuccessHandlerInterface
{
    /**
     * {@inheritDoc}
     */
    public function onLogoutSuccess(Request $request)
    {
        // We keep the relevant infos of the exception
        $alert = array(
                'code' => 0,
                'message' => 'You successfully logged out');

        // And return the encoded alert in response
        $response = new Response(json_encode($alert));
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}