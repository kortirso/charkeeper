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

        # полное восстановление способностей
        data.energy.transform_values! { 0 }
        # полное восстановление ячеек заклинаний
        data.spent_spell_slots.transform_values! { 0 }
        # восстановление половины костей хитов
        data.spent_hit_dice.transform_values! do |value|
          next 0 if value <= 1

          value - (value / 2)
        end
        # полное восстановление здоровья
        data.health['current'] = data.health['max']
      end

      def do_persist(input)
        input[:character].save!

        { result: :ok }
      end
    end
  end
end
