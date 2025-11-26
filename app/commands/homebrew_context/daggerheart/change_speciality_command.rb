# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeSpecialityCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_speciality

        params do
          required(:speciality).filled(type?: ::Daggerheart::Homebrew::Speciality)
          optional(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        input[:speciality].update!(input.slice(:name))

        refresh_user_data.call(user: input[:speciality].user) if input[:speciality].user

        { result: input[:speciality] }
      end
    end
  end
end
