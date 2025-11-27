# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyRaceCommand < BaseCommand
      include Deps[
        add_race: 'commands.homebrew_context.daggerheart.add_race',
        copy_feats: 'commands.homebrew_context.daggerheart.copy_feats',
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        params do
          required(:race).filled(type?: ::Daggerheart::Homebrew::Race)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        result = ActiveRecord::Base.transaction do
          race = add_race.call({ user: input[:user], name: input[:race].name, no_refresh: true })[:result]

          copy_feats.call(
            feats: input[:race].user.feats.where(origin: 0, origin_value: input[:race].id).to_a,
            user: input[:user],
            origin_value: race.id,
            no_refresh: true
          )

          race
        end

        refresh_user_data.call(user: input[:user])

        { result: result }
      end
    end
  end
end
