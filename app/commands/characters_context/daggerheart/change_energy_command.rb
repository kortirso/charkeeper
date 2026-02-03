# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeEnergyCommand < BaseCommand
      include Deps[
        roll: 'roll',
        duality_roll: 'duality_roll',
        change_project: 'commands.characters_context.daggerheart.projects.change'
      ]

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
            optional(:project).filled(:integer, gteq?: 0, lteq?: 2)
          end
          optional(:make_rolls).filled(:bool)
          optional(:project).hash do
            optional(:id).maybe(:string, :uuid_v4?)
            optional(:dc).maybe(:integer, gt?: 0)
            optional(:manual_roll).maybe(:integer, gt?: 0)
          end
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

        companion = input[:character].companion
        input[:data] = { 'hope_marked' => input[:character].data.hope_marked }
        if input[:value] == 'short' && input[:make_rolls]
          {
            clear_health: 'health_marked', clear_stress: 'stress_marked', clear_armor_slots: 'spent_armor_slots'
          }.each do |key, value|
            next unless input.dig(:options, key).positive?

            rolled_value = roll.call(dice: "#{input.dig(:options, key)}d4", modifier: input[:character].tier)
            input[:data][value] = input[:character].data[value] - rolled_value
            input[:data][value] = [input[:data][value], 0].max

            if companion && companion.data.stress_marked != companion.data.stress_max
              input[:companion_stress_marked] = [companion.data.stress_marked - rolled_value, 0].max
            end
          end
        end
        if input[:value] == 'long'
          input[:data]['health_marked'] = 0 if input.dig(:options, :clear_health).positive?
          input[:data]['stress_marked'] = 0 if input.dig(:options, :clear_stress).positive?
          input[:data]['spent_armor_slots'] = 0 if input.dig(:options, :clear_armor_slots).positive?

          if companion
            input[:companion_stress_marked] =
              if companion.data.stress_marked == companion.data.stress_max
                companion.data.stress_marked - 1
              else
                0
              end
          end
        end
        if input[:value] != 'session'
          input[:data]['hope_marked'] += input.dig(:options, :gain_hope) + (2 * input.dig(:options, :gain_double_hope))
          input[:data]['hope_marked'] = [input[:data]['hope_marked'], input[:character].data.hope_max].min
        end
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/GuardClause

      def do_persist(input)
        refresh_feats(input)
        refresh_reverse_feats(input)
        refresh_companion(input) if input[:companion_stress_marked]
        refresh_project(input) if input.dig(:project, :id)

        if input[:data]
          input[:character].data = ::Daggerheart::CharacterData.new(input[:character].data.attributes.merge(input[:data]))
          input[:character].save
        end

        { result: input[:character] }
      end

      def refresh_companion(input)
        input[:character].companion.data =
          input[:character].companion.data.attributes.merge('stress_marked' => input[:companion_stress_marked])
        input[:character].companion.save
      end

      def refresh_feats(input)
        input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)
      end

      def refresh_reverse_feats(input)
        input[:character].feats
          .joins(:feat)
          .where(feats: { reverse_refresh: true })
          .where(limit_refresh: limit_refresh(input))
          .update_all(used_count: nil)
      end

      def limit_refresh(input)
        case input[:value]
        when 'long' then [0, 1]
        when 'short' then 0
        when 'session' then 2
        end
      end

      def refresh_project(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity
        project = input[:character].projects.find_by(id: input.dig(:project, :id))
        return unless project
        return unless input.dig(:options, :project).positive?

        if input.dig(:project, :manual_roll)
          change_project.call(project: project, progress: project.progress + input.dig(:project, :manual_roll))
        elsif input.dig(:project, :dc)
          total = 0
          input.dig(:options, :project).times do
            result = duality_roll.call

            next total += 4 if result[:hope] == result[:fear]
            next total += 3 if result[:total] >= input.dig(:project, :dc) && result[:hope] > result[:fear]
            next total += 2 if result[:total] >= input.dig(:project, :dc)

            total += 1
          end
          change_project.call(project: project, progress: project.progress + total)
        end
      end
    end
  end
end
