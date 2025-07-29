# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class SeraphBuilder
      def call(result:)
        result[:evasion] = 9
        result[:health_max] = 7
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 2, 'agi' => 0, 'fin' => 0, 'ins' => 1, 'pre' => 1, 'know' => -1 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'hallowed_axe'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'round_shield'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'chainmail_armor'), ready_to_use: true)
      end
    end
  end
end
