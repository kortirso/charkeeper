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

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'rapier'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'small_dagger'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'gambeson_armor'), ready_to_use: true)
      end
    end
  end
end
