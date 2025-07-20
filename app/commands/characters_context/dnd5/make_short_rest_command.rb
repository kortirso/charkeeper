# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class MakeShortRestCommand < BaseCommand
      include Deps[roll: 'roll']

      use_contract do
        params do
          required(:character).filled(type?: ::Dnd5::Character)
          optional(:options).hash do
            required(:d6).filled(:integer, gteq?: 0)
            required(:d8).filled(:integer, gteq?: 0)
            required(:d10).filled(:integer, gteq?: 0)
            required(:d12).filled(:integer, gteq?: 0)
          end
          optional(:make_rolls).filled(:bool)
        end
      end

      private

      # rubocop: disable Metrics/AbcSize, Style/GuardClause
      def do_prepare(input)
        return if input[:options].nil?

        input[:spent_hit_dice] = input[:options].stringify_keys.each_with_object({}) do |(key, value), acc|
          key = key.split('d')[1]
          next acc if input[:character].data.spent_hit_dice[key].nil?

          acc[key] = [input[:character].data.spent_hit_dice[key] + value, input[:character].data.hit_dice[key].to_i].min
        end

        if input[:make_rolls]
          con_modifier = (input[:character].data.abilities['con'] / 2) - 5
          input[:health] = [
            input[:character].data.health['current'] + input[:options].inject(0) do |acc, (key, value)|
              value.times { acc += roll.call(dice: "1#{key}", modifier: con_modifier) } if value.positive?
              acc
            end,
            input[:character].data.health['max']
          ].min
        end
      end
      # rubocop: enable Metrics/AbcSize, Style/GuardClause

      def do_persist(input)
        input[:character].feats.where(limit_refresh: 0).update_all(used_count: 0)
        update_character(input)

        { result: :ok }
      end

      def update_character(input)
        return unless input[:options]

        input[:character].data.spent_hit_dice.merge!(input[:spent_hit_dice])
        input[:character].data.health['current'] = input[:health] if input[:health]
        input[:character].save
      end
    end
  end
end
