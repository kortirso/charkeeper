# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Projects
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :daggerheart_project

          params do
            required(:project).filled(type?: ::Daggerheart::Project)
            optional(:title).filled(:string, max_size?: 100)
            optional(:description).filled(:string, max_size?: 1000)
            optional(:complexity).filled(:integer, gt?: 0)
          end
        end

        private

        def do_prepare(input)
          input[:description] = sanitize(input[:description]) if input[:description]
        end

        def do_persist(input)
          input[:project].update!(input.except(:project))

          { result: input[:project] }
        end
      end
    end
  end
end
