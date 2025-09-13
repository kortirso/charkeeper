# frozen_string_literal: true

module Frontend
  module Homebrews
    class FeatsController < Frontend::BaseController
      include Deps[add_daggerheart_feat: 'commands.homebrew_context.daggerheart.add_feat']
      include SerializeRelation
      include SerializeResource

      before_action :find_feats, only: %i[index]
      before_action :find_feat, only: %i[destroy]

      def index
        serialize_relation(@feats, serializer, :feats)
      end

      def create
        case add_service.call(create_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result } then serialize_resource(result, serializer, :feat, {}, :created)
        end
      end

      def destroy
        @feat.destroy
        only_head_response
      end

      private

      def find_feats
        @feats = feats_relation.where(user_id: current_user.id)
      end

      def find_feat
        @feat = feats_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def add_service
        case params[:provider]
        when 'daggerheart' then add_daggerheart_feat
        end
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::FeatSerializer
        end
      end

      def feats_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Feat
        else []
        end
      end
    end
  end
end
