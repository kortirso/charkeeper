# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyRaceCommand < BaseCommand
      include Deps[
        add_race: 'commands.homebrew_context.daggerheart.add_race',
        add_feat: 'commands.homebrew_context.daggerheart.add_feat'
      ]

      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:race).filled(type?: ::Daggerheart::Homebrew::Race)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input)
        result = ActiveRecord::Base.transaction do
          race = add_race.call({ user: input[:user], name: input[:race].name })[:result]

          input[:race].user.feats.where(origin: 0, origin_value: input[:race].id).find_each do |feat|
            add_feat.call(feat_attributes(feat, race).merge({ user: input[:user] }))
          end

          race
        end

        { result: result }
      end

      def feat_attributes(feat, race)
        feat
          .attributes
          .slice('origin', 'kind', 'limit', 'limit_refresh', 'subclass_mastery')
          .symbolize_keys
          .merge({
            origin_value: race.id,
            title: feat.title['en'],
            description: feat.description['en'],
            limit: feat.description_eval_variables['limit']
          }).compact
      end
    end
  end
end
