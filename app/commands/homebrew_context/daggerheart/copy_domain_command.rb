# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyDomainCommand < BaseCommand
      include Deps[
        add_domain: 'commands.homebrew_context.daggerheart.add_domain',
        copy_feats: 'commands.homebrew_context.daggerheart.copy_feats'
      ]

      use_contract do
        params do
          required(:domain).filled(type?: ::Daggerheart::Homebrew::Domain)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input)
        result = ActiveRecord::Base.transaction do
          domain = add_domain.call({ user: input[:user], name: input[:domain].name })[:result]

          copy_feats.call(
            feats: input[:domain].user.feats.where(origin: 7, origin_value: input[:domain].id).to_a,
            user: input[:user],
            origin_value: domain.id
          )

          community
        end

        { result: result }
      end
    end
  end
end
