# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeTransformationCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

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

        refresh_user_data.call(user: input[:transformation].user) if input[:transformation].user

        { result: input[:transformation] }
      end
    end
  end
end
