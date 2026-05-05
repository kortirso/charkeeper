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

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
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

        # восстановление истощения
        data.exhaustion = [data.exhaustion - 1, 0].max
      end

      def do_persist(input)
        input[:character].save!
        input[:character].feats.update_all(used_count: 0)

        refresh_resources(input)

        { result: :ok }
      end

      def refresh_resources(input) # rubocop: disable Metrics/AbcSize
        input[:character].resources.includes(:custom_resource).find_each do |resource|
          max_value = resource.custom_resource.max_value
          reset_direction = resource.custom_resource.reset_direction
          change = resource.custom_resource.resets['long']

          value =
            case change
            when -1 then reset_direction.zero? ? 0 : max_value
            when 0 then resource.value
            else
              reset_direction.zero? ? [resource.value - change.abs, 0].max : [resource.value + change.abs, max_value].min
            end

          resource.update(value: value)
        end
      end
    end
  end
end
