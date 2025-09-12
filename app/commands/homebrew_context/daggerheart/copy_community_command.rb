# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyCommunityCommand < BaseCommand
      include Deps[
        add_community: 'commands.homebrew_context.daggerheart.add_community',
        add_feat: 'commands.homebrew_context.daggerheart.add_feat'
      ]

      use_contract do
        params do
          required(:community).filled(type?: ::Daggerheart::Homebrew::Community)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input)
        result = ActiveRecord::Base.transaction do
          community = add_community.call({ user: input[:user], name: input[:community].name })[:result]

          input[:community].user.feats.where(origin: 1, origin_value: input[:community].id).find_each do |feat|
            add_feat.call(feat_attributes(feat, community).merge({ user: input[:user] }))
          end

          community
        end

        { result: result }
      end

      def feat_attributes(feat, community)
        feat
          .attributes
          .slice('origin', 'kind', 'limit', 'limit_refresh')
          .symbolize_keys
          .merge({
            origin_value: community.id,
            title: feat.title['en'],
            description: feat.description['en'],
            limit: feat.description_eval_variables['limit']
          }).compact
      end
    end
  end
end
