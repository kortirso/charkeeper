# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeEnergyCommand < BaseCommand
      include Deps[roll: 'roll']

      use_contract do
        config.messages.namespace = :daggerheart_rest

        Rests = Dry::Types['strict.string'].enum('short', 'long', 'session')

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:value).filled(Rests)
          optional(:options).hash do
            required(:clear_health).filled(:integer, gteq?: 0, lteq?: 2)
            required(:clear_stress).filled(:integer, gteq?: 0, lteq?: 2)
            required(:clear_armor_slots).filled(:integer, gteq?: 0, lteq?: 2)
            required(:gain_hope).filled(:integer, gteq?: 0, lteq?: 2)
            required(:gain_double_hope).filled(:integer, gteq?: 0, lteq?: 2)
          end
          optional(:make_rolls).filled(:bool)
        end

        rule(:options) do
          next if value.nil?
          next if value.values.sum <= 2

          key.failure(:too_many_expectations)
        end
      end

      private

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/GuardClause
      def do_prepare(input)
        return if input[:options].nil?

        input[:data] = { 'hope_marked' => input[:character].data.hope_marked }
        if input[:value] == 'short' && input[:make_rolls]
          {
            clear_health: 'health_marked', clear_stress: 'stress_marked', clear_armor_slots: 'spent_armor_slots'
          }.each do |key, value|
            next unless input.dig(:options, key).positive?

            rolled_value = roll.call(dice: "#{input.dig(:options, key)}d4", modifier: input[:character].tier)
            input[:data][value] = input[:character].data.attributes[value] - rolled_value
            input[:data][value] = [input[:data][value], 0].max
          end
        end
        if input[:value] == 'long'
          input[:data]['health_marked'] = 0 if input.dig(:options, :clear_health).positive?
          input[:data]['stress_marked'] = 0 if input.dig(:options, :clear_stress).positive?
          input[:data]['spent_armor_slots'] = 0 if input.dig(:options, :clear_armor_slots).positive?
        end
        if input[:value] != 'session'
          input[:data]['hope_marked'] += input.dig(:options, :gain_hope) + (2 * input.dig(:options, :gain_double_hope))
          input[:data]['hope_marked'] = [input[:data]['hope_marked'], input[:character].data.hope_max].min
        end
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/GuardClause

      def do_persist(input)
        input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)

        if input[:data]
          input[:character].data = ::Daggerheart::CharacterData.new(input[:character].data.attributes.merge(input[:data]))
          input[:character].save
        end

        { result: input[:character] }
      end

      def limit_refresh(input)
        case input[:value]
        when 'long' then [0, 1]
        when 'short' then 0
        when 'session' then 2
        end
      end
    end
  end
end
