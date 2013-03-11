<?php

namespace Paztek\Bundle\HomeBundle\Security\Http\Authentication;

use JMS\Serializer\SerializerInterface;

use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AjaxAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    protected $serializer;
    
    public function setSerializer(SerializerInterface $serializer = null)
    {
        $this->serializer = $serializer;
    }
    
    /**
     * {@inheritDoc}
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        // We grab the entity associated with the logged in user or null if user not logged in
        $user = $token->getUser();

        // We serialize it to JSON
        $json = $this->serializer->serialize($user, 'json');

        // And return the response
        $response = new Response($json);
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}