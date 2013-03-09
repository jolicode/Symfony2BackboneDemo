<?php

namespace Paztek\Bundle\HomeBundle\Security\Http\Authentication;

use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AjaxAuthenticationFailureHandler implements AuthenticationFailureHandlerInterface
{
    /**
     * {@inheritDoc}
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        // We keep the relevant infos of the exception
        $alert = array(
                'code' => $exception->getCode(),
                'message' => $exception->getMessage(),
                'level' => 'error');

        // And return the encoded alert in response
        $response = new Response(json_encode($alert), 403); // OK, this might not be the most appropriate HTTP status code, but apparently nobody agrees on this one
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}