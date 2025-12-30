# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WarriorBuilder
      include Deps[item_add: 'commands.characters_context.items.add']

      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 1, 'agi' => 2, 'fin' => 0, 'ins' => 1, 'pre' => -1, 'know' => 0 }
        result
      end

      def equip(character:)
        item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'longsword'), state: 'hands')
        item_add.call(character: character, item: Daggerheart::Item.find_by(slug: 'chainmail_armor'), state: 'equipment')
      end
    end
  end
end
