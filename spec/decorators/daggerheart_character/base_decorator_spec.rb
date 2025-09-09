# frozen_string_literal: true

describe DaggerheartCharacter::BaseDecorator do
  subject(:decorator) { described_class.new(Character.find(character.id)) }

  let!(:character) { create :character, :daggerheart }

  before do
    create :character_bonus, character: character, value: { proficiency: 1, traits: { know: 1 } }
    create :character_bonus, character: character, value: { evasion: 1, health: 2, attack: 1 }
  end

  it 'does not raise errors', :aggregate_failures do
    expect { decorator.id }.not_to raise_error
    expect(decorator.proficiency).to eq 3
    expect(decorator.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
    expect(decorator.modified_traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => 0 })
    expect(decorator.damage_thresholds).to eq({ 'major' => 4, 'severe' => 8 })
    expect(decorator.evasion).to eq 12
    expect(decorator.health_max).to eq 8
    expect(decorator.attacks.dig(0, :attack_bonus)).to eq 2
    expect(decorator.attacks.dig(0, :damage)).to eq '3d4'
  end

  context 'for beastform' do
    before do
      character.data = character.data.merge({ beastform: 'agile_scout' })
      character.save
    end

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.proficiency).to eq 3
      expect(decorator.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
      expect(decorator.modified_traits).to eq({ 'str' => 1, 'agi' => 3, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => 0 })
      expect(decorator.damage_thresholds).to eq({ 'major' => 4, 'severe' => 8 })
      expect(decorator.evasion).to eq 14
      expect(decorator.health_max).to eq 8
      expect(decorator.attacks.dig(0, :attack_bonus)).to eq 4
      expect(decorator.attacks.dig(0, :damage)).to eq '2d8'
    end
  end
end
