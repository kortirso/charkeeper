# frozen_string_literal: true

describe DaggerheartCharacter::BaseDecorator do
  subject(:decorator) do
    base_decorator = described_class.new(Character.find(character.id))
    base_features_decorator = DaggerheartCharacter::FeaturesBaseDecorator.new(base_decorator)
    base_features_decorator.features
    stats_decorator = DaggerheartCharacter::StatsDecorator.new(base_features_decorator)
    features_decorator = DaggerheartCharacter::FeaturesDecorator.new(stats_decorator)
    features_decorator.features
    features_decorator
  end

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

  context 'with bonus to thresholds' do
    before { create :character_bonus, character: character, value: { thresholds: { major: 1, severe: 2 } } }

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.damage_thresholds).to eq({ 'major' => 5, 'severe' => 10 })
    end
  end

  context 'with equiped armor' do
    let!(:armor) do
      create :item, :daggerheart, kind: 'armor', info: {
        bonuses: { traits: { str: -1 }, evasion: -1, base_score: 4, thresholds: { major: 7, severe: 14 } }
      }
    end

    before { create :character_item, character: character, item: armor, state: Character::Item::EQUIPMENT }

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.level).to eq 4
      expect(decorator.armor_score).to eq 4
      expect(decorator.damage_thresholds).to eq({ 'major' => 11, 'severe' => 18 })
    end

    context 'with bonus to thresholds' do
      before { create :character_bonus, character: character, value: { armor_score: 1, thresholds: { major: 1, severe: 2 } } }

      it 'does not raise errors', :aggregate_failures do
        expect { decorator.id }.not_to raise_error
        expect(decorator.armor_score).to eq 5
        expect(decorator.damage_thresholds).to eq({ 'major' => 12, 'severe' => 20 })
      end

      context 'with weapon' do
        let!(:weapon) do
          create :item, :daggerheart, kind: 'primary weapon', info: { bonuses: { traits: { pre: 1 }, evasion: -1, attack: 1 } }
        end

        before { create :character_item, character: character, item: weapon, state: Character::Item::HANDS }

        it 'does not raise errors', :aggregate_failures do
          expect { decorator.id }.not_to raise_error
          expect(decorator.proficiency).to eq 3
          expect(decorator.traits).to eq({ 'str' => 1, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 0, 'know' => -1 })
          expect(decorator.modified_traits).to eq({ 'str' => 0, 'agi' => 2, 'fin' => 1, 'ins' => 0, 'pre' => 1, 'know' => 0 })
          expect(decorator.damage_thresholds).to eq({ 'major' => 12, 'severe' => 20 })
          expect(decorator.evasion).to eq 10
          expect(decorator.health_max).to eq 8
          expect(decorator.attacks.dig(1, :attack_bonus)).to eq 4
        end
      end
    end

    context 'with bare bones feat' do
      let!(:feat) do
        create :feat, :rally, bonus_eval_variables: {
          base_armor_score: "equiped_armor_info ? base_armor_score : (5 + modified_traits['str'])",
          base_damage_thresholds: "equiped_armor_info ? base_damage_thresholds : ({ 'major' => 7 + tier * 2, 'severe' => (tier == 1 ? 19 : (10 + tier * 7)) })" # rubocop: disable Layout/LineLength
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
          expect(decorator.armor_score).to eq 6
          expect(decorator.damage_thresholds).to eq({ 'major' => 15, 'severe' => 28 })
        end

        context 'with bonus to thresholds' do
          before { create :character_bonus, character: character, value: { thresholds: { major: 1, severe: 2 } } }

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
