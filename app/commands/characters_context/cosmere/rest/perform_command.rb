# frozen_string_literal: true

module CharactersContext
  module Cosmere
    module Rest
      class PerformCommand < BaseCommand
        include Deps[
          character_update: 'commands.characters_context.cosmere.update',
          roll: 'roll'
        ]

        use_contract do
          config.messages.namespace = :cosmere_rest

          Rests = Dry::Types['strict.string'].enum('short', 'long')

          params do
            required(:character).filled(type?: ::Cosmere::Character)
            required(:value).filled(Rests)
            optional(:make_rolls).filled(:bool)
            optional(:health_max).filled(:integer)
            optional(:focus_max).filled(:integer)
            optional(:recovery_die).filled(:integer)
          end
        end

        private

        def lock_key(input) = "character_update_#{input[:character].id}"
        def lock_time = 0

        def do_prepare(input)
          if input[:value] == 'long'
            input[:health] = input[:health_max]
            input[:focus] = input[:focus_max]
          end

          if input[:value] == 'short' && input[:make_rolls] && input[:recovery_die]
            input[:recovery] = roll.call(dice: "1d#{input[:recovery_die]}")
          end
        end

        def do_persist(input)
          character_update.call(input.slice(:character, :health, :focus))

          { result: input[:character], recovery: input[:recovery] }
        end
      end
    end
  end
end
