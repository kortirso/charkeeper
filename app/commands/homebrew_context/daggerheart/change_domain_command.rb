# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeDomainCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_domain

        params do
          required(:domain).filled(type?: ::Daggerheart::Homebrew::Domain)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:domain].update!(input.slice(:name, :public))

        refresh_user_data.call(user: input[:domain].user) if input[:domain].user

        { result: input[:domain] }
      end
    end
  end
end
