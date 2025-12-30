# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyCommunityCommand < BaseCommand
      include Deps[
        add_community: 'commands.homebrew_context.daggerheart.add_community',
        copy_feats: 'commands.homebrew_context.daggerheart.copy_feats'
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

          copy_feats.call(
            feats: input[:community].user.feats.where(origin: 1, origin_value: input[:community].id).to_a,
            user: input[:user],
            origin_value: community.id,
            no_refresh: true
          )

          community
        end

        { result: result }
      end
    end
  end
end
