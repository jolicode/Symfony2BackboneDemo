<?php

namespace Paztek\Bundle\HomeBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use Paztek\Bundle\HomeBundle\Entity\Fruit;

/**
 * Fill the database with some juicy fruits
 * 
 * @author matthieu
 *
 */
class LoadFruitData implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {
        $apples = new Fruit();
        $apples->setName('Apples');
        $apples->setEnabled(true);
        $apples->setPrice(1.45);
        
        $manager->persist($apples);
        
        $oranges = new Fruit();
        $oranges->setName('Oranges');
        $oranges->setEnabled(false);
        $oranges->setPrice(2.75);
        
        $manager->persist($oranges);
        
        $bananas = new Fruit();
        $bananas->setName('Bananas');
        $bananas->setEnabled(true);
        $bananas->setPrice(1.95);
        
        $manager->persist($bananas);
        
        $strawberries = new Fruit();
        $strawberries->setName('Strawberries');
        $strawberries->setEnabled(true);
        $strawberries->setPrice(4.00);
        
        $manager->persist($strawberries);
        
        $manager->flush();
    }
}