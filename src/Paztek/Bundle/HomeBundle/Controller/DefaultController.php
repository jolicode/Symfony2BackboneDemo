<?php

namespace Paztek\Bundle\HomeBundle\Controller;

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
        $serializer = $this->container->get('serializer');
        
        // We grab the entity associated with the logged in user or null if user not logged in
        $user = $this->getUser();
        
        // We serialize it to JSON
        $json = $serializer->serialize($user, 'json');
        
        // And pass it to the template to bootstrap our Backbone app
        return array('user' => $json);
    }
}
