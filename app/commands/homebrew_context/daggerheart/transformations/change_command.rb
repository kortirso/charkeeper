# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    module Transformations
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_transformation

          params do
            required(:transformation).filled(type?: ::Daggerheart::Homebrew::Transformation)
            optional(:name).filled(:string, max_size?: 50)
            optional(:public).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          input[:name_json] = { en: input[:name], ru: input[:name] } if input.key?(:name)
        end

        def do_persist(input)
          input[:transformation].update!(input.slice(:name, :name_json, :public))

          { result: input[:transformation] }
        end
      end
    end
  end
end
