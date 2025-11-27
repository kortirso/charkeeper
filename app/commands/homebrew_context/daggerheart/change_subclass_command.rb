# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeSubclassCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_subclass

        params do
          required(:subclass).filled(type?: ::Daggerheart::Homebrew::Subclass)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:subclass].update!(input.slice(:name, :public))

        refresh_user_data.call(user: input[:subclass].user) if input[:subclass].user

        { result: input[:subclass] }
      end
    end
  end
end
