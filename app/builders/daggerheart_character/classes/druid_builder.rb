# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class DruidBuilder
      def call(result:)
        result[:evasion] = 10
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 0, 'agi' => 1, 'fin' => 1, 'ins' => 2, 'pre' => -1, 'know' => 0 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'shortstaff'), state: 'hands')
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'round_shield'), state: 'hands')
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'leather_armor'), state: 'equipment')
      end
    end
  end
end
