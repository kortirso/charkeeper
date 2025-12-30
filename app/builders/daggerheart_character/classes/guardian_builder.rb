# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class GuardianBuilder
      include Deps[item_add: 'commands.characters_context.items.add']

      def call(result:)
        result[:evasion] = 9
        result[:health_max] = 7
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 2, 'agi' => 1, 'fin' => -1, 'ins' => 0, 'pre' => 1, 'know' => 0 }
        result
      end

      def equip(character:)
        item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'battleaxe'), state: 'hands')
        item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'chainmail_armor'), state: 'equipment')
      end
    end
  end
end
