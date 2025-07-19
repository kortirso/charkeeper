# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class MakeLongRestCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd5::Character)
        end
      end

      private

      def do_prepare(input)
        data = input[:character].data

        # полное восстановление ячеек заклинаний
        data.spent_spell_slots.transform_values! { 0 }

        # восстановление половины максимальных костей хитов
        # { 6 => 4, 8 => 0, 10 => 3 } => { 6 => 2, 8 => 0, 10 => 2 }
        restore_hit_dice = data.hit_dice.transform_values do |value|
          value - (value / 2)
        end
        data.spent_hit_dice.merge!(restore_hit_dice) do |_key, v1, v2|
          [v1 - v2, 0].max
        end

        # полное восстановление здоровья
        data.health['current'] = data.health['max']
      end

      def do_persist(input)
        input[:character].save!
        input[:character].feats.update_all(used_count: 0)

        { result: :ok }
      end
    end
  end
end
