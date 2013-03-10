<?php

namespace Paztek\Bundle\HomeBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
    /**
     * Our homepage
     * 
     * @Route("/")
     * @Template()
     */
    public function indexAction()
    {
        $data = array();
        
        // We grab the entity associated with the logged in user or null if user not logged in
        $user = $this->getUser();
        $data['user'] = $user;
        
        // We query the resources needed based on user's roles
        if ($this->container->get('security.context')->isGranted('ROLE_USER')) {
            $fruits = $this->getDoctrine()->getRepository('PaztekHomeBundle:Fruit')->findAll();
            $data['fruits'] = $fruits;
        }
        if ($this->container->get('security.context')->isGranted('ROLE_ADMIN')) {
            $users = $this->getDoctrine()->getRepository('PaztekHomeBundle:User')->findAll();
            $data['users'] = $users;
        }
        
        // And pass all of it to the template to bootstrap our Backbone app
        return $data;
    }
    
    /**
     * Returns a JSON-encoded list of fruits
     * @Route("/fruits")
     */
    public function fruitsAction() {
        if ($this->container->get('security.context')->isGranted('ROLE_USER')) {
            $fruits = $this->getDoctrine()->getRepository('PaztekHomeBundle:Fruit')->findAll();
            
            $serializer = $this->container->get('serializer');
            $json = $serializer->serialize($fruits, 'json');
            
            $response = new Response($json);
            $response->headers->set('Content-Type', 'application/json');
            
            return $response;
        } else {
            $error =  array('level' => 'error', 'message' => 'You don\'t have the required role to access this resource');
            
            $response = new Response(json_encode($error), 401);
            $response->headers->set('Content-Type', 'application/json');
            
            return $response;
        }
    }
    
    /**
     * Returns a JSON-encoded list of users
     * @Route("/users")
     */
    public function usersAction() {
        if ($this->container->get('security.context')->isGranted('ROLE_ADMIN')) {
            $users = $this->getDoctrine()->getRepository('PaztekHomeBundle:User')->findAll();
            
            $serializer = $this->container->get('serializer');
            $json = $serializer->serialize($users, 'json');
            
            $response = new Response($json);
            $response->headers->set('Content-Type', 'application/json');
            
            return $response;
        } else {
            $error =  array('level' => 'error', 'message' => 'You don\'t have the required role to access this resource');
            
            $response = new Response(json_encode($error), 401);
            $response->headers->set('Content-Type', 'application/json');
            
            return $response;
        }
    }
}
