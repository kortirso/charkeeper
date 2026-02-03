# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Projects
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :daggerheart_project

          params do
            required(:character).filled(type?: ::Daggerheart::Character)
            required(:title).filled(:string, max_size?: 100)
            required(:description).filled(:string, max_size?: 1000)
            required(:complexity).filled(:integer, gt?: 0)
          end
        end

        private

        def do_prepare(input)
          input[:description] = sanitize(input[:description])
        end

        def do_persist(input)
          result = ::Daggerheart::Project.create!(input)

          { result: result }
        end
      end
    end
  end
end
