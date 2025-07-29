# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class RogueBuilder
      def call(result:)
        result[:evasion] = 12
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => -1, 'agi' => 1, 'fin' => 2, 'ins' => 0, 'pre' => 1, 'know' => 0 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'dagger'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'small_dagger'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'gambeson_armor'), ready_to_use: true)
      end
    end
  end
end
