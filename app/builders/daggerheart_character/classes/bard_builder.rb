# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class BardBuilder
      def call(result:)
        result[:evasion] = 10
        result[:health_max] = 5
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => -1, 'agi' => 0, 'fin' => 1, 'ins' => 0, 'pre' => 2, 'know' => 1 }
        result
      end

      # rubocop: disable Layout/LineLength
      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'rapier'), states: Character::Item.default_states.merge({ 'hands' => 1 }))
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'small_dagger'), states: Character::Item.default_states.merge({ 'hands' => 1 }))
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'gambeson_armor'), states: Character::Item.default_states.merge({ 'equipment' => 1 }))
      end
      # rubocop: enable Layout/LineLength
    end
  end
end
