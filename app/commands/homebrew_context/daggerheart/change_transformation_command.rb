# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeTransformationCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_transformation

        params do
          required(:transformation).filled(type?: ::Daggerheart::Homebrew::Transformation)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:transformation].update!(input.slice(:name, :public))

        { result: input[:transformation] }
      end
    end
  end
end
