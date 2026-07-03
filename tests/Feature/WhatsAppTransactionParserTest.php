<?php

namespace Tests\Feature;

use App\Services\WhatsApp\WhatsAppTransactionParser;
use PHPUnit\Framework\TestCase;

class WhatsAppTransactionParserTest extends TestCase
{
    public function test_can_parse_amounts()
    {
        $parser = new WhatsAppTransactionParser();

        $result1 = $parser->parse('bensin 50rb');
        $this->assertEquals(50000, $result1['amount']);
        $this->assertEquals('expense', $result1['type']);

        $result2 = $parser->parse('makan 50k');
        $this->assertEquals(50000, $result2['amount']);

        $result3 = $parser->parse('beli nasgor 25rb');
        $this->assertEquals(25000, $result3['amount']);
        
        $result4 = $parser->parse('gaji 5jt');
        $this->assertEquals(5000000, $result4['amount']);
        $this->assertEquals('income', $result4['type']);
    }

    public function test_can_parse_confirmation_commands_case_insensitively()
    {
        $parser = new WhatsAppTransactionParser();

        $this->assertEquals(['command' => 'ok'], $parser->parse('ok'));
        $this->assertEquals(['command' => 'ok'], $parser->parse('OK'));
        $this->assertEquals(['command' => 'batal'], $parser->parse('batal'));
        $this->assertEquals(['command' => 'batal'], $parser->parse('BATAL'));
        $this->assertEquals(['command' => 'batal'], $parser->parse('Batal'));
    }

    public function test_can_categorize_subscription_services()
    {
        $parser = new WhatsAppTransactionParser();

        $this->assertEquals('Langganan', $parser->parse('Langganan Youtube 50k')['category']);
        $this->assertEquals('Langganan', $parser->parse('youtube 50k')['category']);
        $this->assertEquals('Langganan', $parser->parse('chatgpt 300k')['category']);
        $this->assertEquals('Langganan', $parser->parse('netflix 65rb')['category']);
    }
}
