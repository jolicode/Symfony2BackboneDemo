<?php

namespace Paztek\Bundle\HomeBundle\Security\Http\Authentication;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AjaxAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface, ContainerAwareInterface
{
    protected $container;
    
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
    
    /**
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        $serializer = $this->container->get('serializer');

        // We grab the entity associated with the logged in user or null if user not logged in
        $user = $token->getUser();

        // We serialize it to JSON
        $json = $serializer->serialize($user, 'json');

        // And return the response
        $response = new Response($json);
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}