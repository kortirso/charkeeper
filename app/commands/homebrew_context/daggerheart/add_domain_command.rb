# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddDomainCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_domain

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Domain.create!(input)

        refresh_user_data.call(user: input[:user])

        { result: result }
      end
    end
  end
end
