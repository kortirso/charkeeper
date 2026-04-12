# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Animals
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :character_animal_companion

          Kinds = Dry::Types['strict.string'].enum(*Config.data('pathfinder2', 'animals').keys)

          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(Kinds)
          end
        end

        private

        def do_prepare(input)
          config = ::Config.data('pathfinder2', 'animals')[input[:kind]]
          input[:data] =
            config
              .slice('size', 'abilities', 'speeds', 'vision')
              .merge({
                'level' => 1,
                'age' => 'young',
                'selected_skills' => { 'acrobatics' => 1, 'athletics' => 1, config['skill'] => 1 },
                'health' => 6 + config.dig('abilities', 'con') + config['health'],
                'kind' => input[:kind]
              })
        end

        def do_persist(input)
          result = ::Pathfinder2::Character::AnimalCompanion.create!(input.except(:kind))

          { result: result }
        end
      end
    end
  end
end
