# frozen_string_literal: true

module Adminbook
  class FeatsController < Adminbook::BaseController
    def index
      @feats = ::Feat.where(type: feat_class.to_s, user_id: [nil, admin_id]).order(origin: :asc, origin_value: :asc)
      @feats = @feats.where(origin: params[:origin]) if params[:origin]
    end

    def new
      @feat = feat_class.new
    end

    def edit
      @feat = feat_class.find(params[:id])
    end

    def create
      feat = feat_class.new(transform_params(feat_params))
      feat.save
      redirect_to adminbook_feats_path(provider: params[:provider])
    end

    def update
      feat = feat_class.find(params[:id])
      feat.update(transform_params(feat_params))
      redirect_to adminbook_feats_path(provider: params[:provider])
    end

    def destroy
      feat = feat_class.find(params[:id])
      feat.destroy
      redirect_to adminbook_feats_path(provider: params[:provider])
    end

    private

    def feat_class
      @feat_class =
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Feat
        when 'dnd5' then ::Dnd5::Feat
        when 'dnd2024' then ::Dnd2024::Feat
        end
    end

    def transform_params(updating_params)
      %w[bonus_eval_variables description_eval_variables eval_variables options conditions].each do |attribute|
        updating_params[attribute] = JSON.parse(updating_params[attribute].gsub(' =>', ':').gsub('nil', 'null'))
      end
      updating_params['exclude'] = updating_params['exclude'].split(',')
      updating_params['limit_refresh'] = nil if updating_params['limit_refresh'].blank?
      updating_params
    end

    def feat_params
      params.require(:feat).permit!.to_h
    end

    def admin_id
      '64de04ab-795e-473d-9672-2dadf86e65be'
    end
  end
end
