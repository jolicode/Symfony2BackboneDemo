<?php

namespace Paztek\Bundle\HomeBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use Paztek\Bundle\HomeBundle\Entity\User;

/**
 * Fill the database with some users
 * 
 * @author matthieu
 *
 */
class LoadUserData implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {
        $user = new User();
        $user->setUsername('user');
        $user->setPlainPassword('user');
        $user->setEnabled(true);
        $user->setEmail('user@example.com');
        $user->setRoles(array('ROLE_USER'));
        
        $manager->persist($user);
        
        $admin = new User();
        $admin->setUsername('admin');
        $admin->setPlainPassword('admin');
        $admin->setEnabled(true);
        $admin->setEmail('admin@example.com');
        $admin->setRoles(array('ROLE_ADMIN'));
        
        $manager->persist($admin);
        
        $manager->flush();
    }
}