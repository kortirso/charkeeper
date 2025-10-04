# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyTransformationCommand < BaseCommand
      include Deps[
        add_transformation: 'commands.homebrew_context.daggerheart.add_transformation',
        add_feat: 'commands.homebrew_context.daggerheart.add_feat'
      ]

      use_contract do
        params do
          required(:transformation).filled(type?: ::Daggerheart::Homebrew::Transformation)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        result = ActiveRecord::Base.transaction do
          transformation = add_transformation.call({ user: input[:user], name: input[:transformation].name })[:result]

          input[:transformation].user.feats.where(origin: 6, origin_value: input[:transformation].id).find_each do |feat|
            add_feat.call(feat_attributes(feat, transformation).merge({ user: input[:user] }))
          end

          community
        end

        { result: result }
      end

      def feat_attributes(feat, transformation)
        feat
          .attributes
          .slice('origin', 'kind', 'limit', 'limit_refresh')
          .symbolize_keys
          .merge({
            origin_value: transformation.id,
            title: feat.title['en'],
            description: feat.description['en'],
            limit: feat.description_eval_variables['limit']
          }).compact
      end
    end
  end
end
