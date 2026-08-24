# frozen_string_literal: true

describe DaggerheartDecorator do
  subject(:decorator) { described_class.new.call(character: character_record) }

  let!(:character) { create :character, :daggerheart }
  let!(:character_record) { Character.find(character.id) }

  before do
    create :character_bonus, bonusable: character, enabled: true, value: {
      'proficiency' => { 'type' => 'add', 'value' => 1 },
      'know' => { 'type' => 'add', 'value' => 1 }
    }
    create :character_bonus, bonusable: character, enabled: true, value: {
      'evasion' => { 'type' => 'add', 'value' => 1 },
      'health_max' => { 'type' => 'add', 'value' => 2 },
      'attack' => { 'type' => 'add', 'value' => 1 }
    }
  end

  it 'does not raise errors', :aggregate_failures do
    expect { decorator.id }.not_to raise_error
    expect(decorator.proficiency).to eq 3
    expect(character_record.data.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
    expect(decorator.modified_traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => 0 })
    expect(decorator.damage_thresholds).to eq({ 'major' => 4, 'severe' => 8 })
    expect(decorator.evasion).to eq 11
    expect(decorator.health_max).to eq 7
    expect(decorator.attacks.dig(0, :attack_bonus)).to eq 2
    expect(decorator.attacks.dig(0, :damage)).to eq '3d4'
  end

  context 'with bonus to thresholds' do
    before do
      create :character_bonus, bonusable: character, value: {
        'damage_thresholds.major' => { 'type' => 'add', 'value' => 1 },
        'damage_thresholds.severe' => { 'type' => 'add', 'value' => 2 }
      }
    end

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.damage_thresholds).to eq({ 'major' => 5, 'severe' => 10 })
    end
  end

  context 'with equiped armor' do
    let!(:armor) do
      create :item, :daggerheart, kind: 'armor', modifiers: {
        'armor_score' => { 'type' => 'add', 'value' => 4 },
        'str' => { 'type' => 'add', 'value' => -1 },
        'evasion' => { 'type' => 'add', 'value' => -1 },
        'damage_thresholds.major' => { 'type' => 'add', 'value' => 7 },
        'damage_thresholds.severe' => { 'type' => 'add', 'value' => 14 }
      }
    end

    before do
      create :character_item, character: character, item: armor, states: Character::Item.default_states.merge('equipment' => 1)
    end

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.level).to eq 4
      expect(decorator.armor_score).to eq 4
      expect(decorator.damage_thresholds).to eq({ 'major' => 11, 'severe' => 18 })
    end

    context 'with bonus to thresholds' do
      before do
        create :character_bonus, bonusable: character, value: {
          'armor_score' => { 'type' => 'add', 'value' => 1 },
          'damage_thresholds.major' => { 'type' => 'add', 'value' => 1 },
          'damage_thresholds.severe' => { 'type' => 'add', 'value' => 2 }
        }
      end

      it 'does not raise errors', :aggregate_failures do
        expect { decorator.id }.not_to raise_error
        expect(decorator.armor_score).to eq 5
        expect(decorator.damage_thresholds).to eq({ 'major' => 12, 'severe' => 20 })
      end

      context 'with weapon' do
        let!(:weapon) do
          create :item, :daggerheart, kind: 'primary weapon', modifiers: {
            'pre' => { 'type' => 'add', 'value' => 1 },
            'evasion' => { 'type' => 'add', 'value' => -1 },
            'attack' => { 'type' => 'add', 'value' => 1 }
          }
        end

        before do
          create :character_item,
                 character: character,
                 item: weapon,
                 states: Character::Item.default_states.merge('equipment' => 1)
        end

        it 'does not raise errors', :aggregate_failures do
          expect { decorator.id }.not_to raise_error
          expect(decorator.proficiency).to eq 3
          expect(decorator.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
          expect(decorator.modified_traits).to eq({ 'str' => 0, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 1, 'know' => 0 })
          expect(decorator.damage_thresholds).to eq({ 'major' => 12, 'severe' => 20 })
          expect(decorator.evasion).to eq 9
          expect(decorator.health_max).to eq 7
          expect(decorator.attacks.dig(1, :attack_bonus)).to eq 4
        end
      end
    end

    context 'with bare bones feat' do
      let!(:feat) do
        create :feat, :rally, modifiers: {
          'armor_score' => { 'type' => 'set', 'value' => 'if (no_armor, 3 + str, 0)' },
          'damage_thresholds.major' => { 'type' => 'set', 'value' => 'if (no_armor, 7 + tier * 2, 0)' },
          'damage_thresholds.severe' => { 'type' => 'set', 'value' => 'if (no_armor, if (tier == 1, 19, 10 + tier * 7), 0)' }
        }
      end

      before { create :character_feat, character: character, feat: feat, ready_to_use: true }

      context 'with existing armor' do
        it 'returns stats based on armor', :aggregate_failures do
          expect { decorator.id }.not_to raise_error
          expect(decorator.level).to eq 4
          expect(decorator.armor_score).to eq 4
          expect(decorator.damage_thresholds).to eq({ 'major' => 11, 'severe' => 18 })
        end
      end

      context 'without existing armor' do
        before { Character::Item.destroy_all }

        it 'returns stats based on feat', :aggregate_failures do
          expect { decorator.id }.not_to raise_error
          expect(decorator.level).to eq 4
          expect(decorator.armor_score).to eq 4
          expect(decorator.damage_thresholds).to eq({ 'major' => 15, 'severe' => 28 })
        end

        context 'with bonus to thresholds' do
          before do
            create :character_bonus, bonusable: character, value: {
              'damage_thresholds.major' => { 'type' => 'add', 'value' => 1 },
              'damage_thresholds.severe' => { 'type' => 'add', 'value' => 2 }
            }
          end

          it 'does not raise errors', :aggregate_failures do
            expect { decorator.id }.not_to raise_error
            expect(decorator.damage_thresholds).to eq({ 'major' => 16, 'severe' => 30 })
          end
        end
      end
    end
  end

  context 'for beastform' do
    before do
      character_record.data = character_record.data.attributes.merge({ beastform: 'agile_scout' })
      character_record.save
    end

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.proficiency).to eq 3
      expect(decorator.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
      expect(decorator.modified_traits).to eq({ 'str' => 1, 'agi' => 3, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => 0 })
      expect(decorator.damage_thresholds).to eq({ 'major' => 4, 'severe' => 8 })
      expect(decorator.evasion).to eq 13
      expect(decorator.health_max).to eq 7
      expect(decorator.attacks.dig(0, :attack_bonus)).to eq 4
      expect(decorator.attacks.dig(0, :damage)).to eq '3d8'
    end
  end
end
